const service=require('../services/emergencyAllocationService'); const compatibility=require('../services/bloodCompatibilityService');
const types=['O-','O+','A-','A+','B-','B+','AB-','AB+'];
const inventory=(values={})=>types.map(bloodType=>({bloodType,unitsAvailable:values[bloodType]||0,reservedUnits:0}));
const event=(overrides={})=>({eventName:'Exercise',numberOfCasualties:1,bloodTypeStatus:'ALL_UNKNOWN',estimatedUnitsRequired:2,severity:'URGENT',casualtyData:[{casualtyNumber:1,bloodType:'UNKNOWN'}],...overrides});
describe('emergency allocation policy',()=>{
  test('E01 unknown recipients allocate O- above reserve',()=>{const r=service.calculateAllocation(event(),inventory({'O-':10}));expect(r.totalAllocated).toBe(2);expect(r.allocation.find(x=>x.bloodType==='O-').availableAfter).toBe(8);});
  test('E02 insufficient O- reports shortage',()=>{const r=service.calculateAllocation(event({estimatedUnitsRequired:8}),inventory({'O-':10}));expect(r.totalAllocated).toBe(5);expect(r.shortage).toBe(3);});
  test('E03 protects configured O- reserve',()=>{const r=service.calculateAllocation(event({estimatedUnitsRequired:6}),inventory({'O-':10}));expect(r.allocation.find(x=>x.bloodType==='O-').availableAfter).toBe(5);expect(r.warnings).toContain('Configured O-negative emergency reserve reached');});
  test('E04 zero inventory creates critical shortage',()=>{const r=service.calculateAllocation(event(),inventory());expect(r.totalAllocated).toBe(0);expect(r.allocationStatus).toBe('CRITICAL_SHORTAGE');});
  test('E05 request above inventory never projects a negative value',()=>{const r=service.calculateAllocation(event({estimatedUnitsRequired:20}),inventory({'O-':7}));expect(r.allocation.every(x=>x.availableAfter>=0)).toBe(true);});
  test('E06 request below inventory projects the correct remainder',()=>{const r=service.calculateAllocation(event({estimatedUnitsRequired:3}),inventory({'O-':12}));expect(r.allocation.find(x=>x.bloodType==='O-').availableAfter).toBe(9);});
  test.each([0,-1])('E07 rejects invalid casualty count %s',(numberOfCasualties)=>expect(()=>service.calculateAllocation(event({numberOfCasualties}),inventory())).toThrow());
  test('E08 rejects invalid required units through service model assumptions',()=>expect(()=>service.calculateAllocation(event({estimatedUnitsRequired:0}),inventory())).toThrow());
  test('E09 partially known combines compatibility and emergency policy',()=>{const spy=jest.spyOn(compatibility,'rankCompatibleDonors');const r=service.calculateAllocation(event({numberOfCasualties:2,bloodTypeStatus:'PARTIALLY_KNOWN',estimatedUnitsRequired:4,casualtyData:[{casualtyNumber:1,bloodType:'A+'},{casualtyNumber:2,bloodType:'UNKNOWN'}]}),inventory({'A+':5,'O-':10}));expect(spy).toHaveBeenCalledWith('A+',expect.any(Array),2);expect(r.totalAllocated).toBe(4);spy.mockRestore();});
  test('E10 all known uses existing compatibility service',()=>{const spy=jest.spyOn(compatibility,'rankCompatibleDonors');service.calculateAllocation(event({bloodTypeStatus:'ALL_KNOWN',casualtyData:[{casualtyNumber:1,bloodType:'B+'}]}),inventory({'B+':5}));expect(spy).toHaveBeenCalled();spy.mockRestore();});
  test('E15 disabled O+ fallback never automatically allocates O+ to unknown recipient',()=>{const r=service.calculateAllocation(event(),inventory({'O+':50}));expect(r.allocation.find(x=>x.bloodType==='O+').unitsAllocated).toBe(0);});
});
