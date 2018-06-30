import { departmentListView } from "./department-view";

const { editorByAccessor,DataLookup } = OrganicUI;
const { TextField, Checkbox,Select  } = MaterialUI;
editorByAccessor.customTester(s => s.endsWith('Name'), <TextField />);
editorByAccessor.customTester(s => s.endsWith('Date'), <Select />);
editorByAccessor.customTester(s => !!s , <TextField />);
editorByAccessor.set('-', <input type="text" style={{ display: 'none' }} />);
editorByAccessor.set('address', <TextField type="text" />);
editorByAccessor.set('email', <TextField type="text" />);
editorByAccessor.set('gender', <Select type="text" />);
editorByAccessor.set('employmentStatus', <Select type="text" />);
editorByAccessor.set('departmentId', <DataLookup  source={departmentListView} />);

editorByAccessor.set('isActive', <Checkbox />);
editorByAccessor.set('active', <Checkbox   />);