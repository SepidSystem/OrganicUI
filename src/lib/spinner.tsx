import { default as _CircularProgress, CircularProgressProps } from "@material-ui/core/CircularProgress";
const CircularProgress: any = _CircularProgress;
export function Spinner(p: CircularProgressProps) {
    return <CircularProgress size={24} className="loadning-element" thickness={3} {...p} />;
}