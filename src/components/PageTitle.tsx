type Props = { eyebrow: string; title: string; description: string };
export default function PageTitle({ eyebrow, title, description }: Props) {
  return <section className="page-title-block"><div className="eyebrow"><span className="eyebrow-line" /> {eyebrow}</div><h1>{title}</h1><p>{description}</p></section>;
}
