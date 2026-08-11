export default function StatusMessage({error,success}){if(!error&&!success)return null;return <div role="alert" className={`alert ${error?'alert-danger':'alert-success'}`}>{error||success}</div>}
