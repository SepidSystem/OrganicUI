import { default as _CircularProgress, CircularProgressProps } from "@material-ui/core/CircularProgress";
const CircularProgress: any = _CircularProgress;
export function Spinner(p: CircularProgressProps) {
    return <CircularProgress size={24} className=" loading-state  loading-element" thickness={3} {...p} />;
}