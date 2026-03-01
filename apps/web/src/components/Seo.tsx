import { useEffect } from "react";

function setMetaTag(name: string, content: string) {
  const existing = document.head.querySelector<HTMLMetaElement>(
    `meta[name="${name}"]`,
  );
  if (existing) {
    existing.content = content;
    return;
  }

  const meta = document.createElement("meta");
  meta.name = name;
  meta.content = content;
  document.head.appendChild(meta);
}

export default function Seo(props: { title: string; description?: string }) {
  useEffect(() => {
    document.title = props.title;
    if (props.description) setMetaTag("description", props.description);
  }, [props.description, props.title]);

  return null;
}

