const { execFileSync } = require('node:child_process');

const ports = [5051, 5174];
const projectMarker = 'bloodcare-becs';

function powershell(command) {
  return execFileSync('powershell.exe', ['-NoProfile', '-Command', command], { encoding: 'utf8' }).trim();
}

function findProjectAncestor(processId, processes) {
  let current = processes.get(processId); let projectProcess = null; const visited = new Set();
  while (current && current.ProcessId) {
    if (visited.has(current.ProcessId)) break;
    visited.add(current.ProcessId);
    if ((current.CommandLine || '').toLowerCase().includes(projectMarker)) projectProcess = current;
    if (!current.ParentProcessId || current.ParentProcessId === current.ProcessId) break;
    current = processes.get(current.ParentProcessId);
  }
  return projectProcess;
}

if (process.platform === 'win32') {
  const processOutput = powershell('Get-CimInstance Win32_Process | Select-Object ProcessId,ParentProcessId,CommandLine | ConvertTo-Json -Compress');
  const processList = processOutput ? JSON.parse(processOutput) : [];
  const processes = new Map((Array.isArray(processList) ? processList : [processList]).map((item) => [item.ProcessId, item]));
  const output = powershell(`Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | Where-Object { $_.LocalPort -in ${ports.join(',')} } | Select-Object LocalPort,OwningProcess | ConvertTo-Json -Compress`);
  const parsedListeners = output ? JSON.parse(output) : [];
  const listeners = Array.isArray(parsedListeners) ? parsedListeners : [parsedListeners];
  const stopped = new Set();
  for (const listener of listeners) {
    const owner = findProjectAncestor(listener.OwningProcess, processes);
    if (!owner) {
      console.error(`Port ${listener.LocalPort} is used by another application (PID ${listener.OwningProcess}).`);
      process.exitCode = 1;
      continue;
    }
    if (!stopped.has(owner.ProcessId)) {
      console.log(`Stopping previous BloodCare development process on port ${listener.LocalPort}...`);
      execFileSync('taskkill.exe', ['/PID', String(owner.ProcessId), '/T', '/F'], { stdio: 'ignore' });
      stopped.add(owner.ProcessId);
    }
  }
  if (process.exitCode) process.exit(process.exitCode);
}
