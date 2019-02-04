
export default function Svg(p: IProps) {
    const { image, ...otherProps } = p;
    return <span dangerouslySetInnerHTML={{ __html: p.image }} style={otherProps} />
}
interface IProps extends React.CSSProperties {
    image: string;

}