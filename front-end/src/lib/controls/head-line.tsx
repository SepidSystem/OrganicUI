import { Utils } from "../core/utils";
export function Headline(p: React.HTMLAttributes<HTMLDivElement>) {
    return <div  {...p} className={Utils.classNames("animated fadeInUp  title", p.className)}>{p.children}</div>
}