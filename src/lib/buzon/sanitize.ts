import sanitizeHtml from "sanitize-html";

// Sanea el HTML del cuerpo del correo antes de renderizarlo (anti-XSS).
export function sanitizeBody(html: string | null | undefined): string {
  if (!html) return "";
  return sanitizeHtml(html, {
    allowedTags: [
      "p", "br", "b", "strong", "i", "em", "u", "span", "div",
      "ul", "ol", "li", "blockquote", "a", "h1", "h2", "h3", "h4",
      "table", "thead", "tbody", "tr", "td", "th", "hr", "img", "pre", "code",
    ],
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      img: ["src", "alt", "width", "height"],
      // Atributos presentacionales típicos de correos HTML (seguros, no ejecutables).
      "*": [
        "style", "bgcolor", "color", "align", "valign", "width", "height",
        "cellpadding", "cellspacing", "border", "role", "dir",
      ],
    },
    allowedSchemes: ["http", "https", "mailto", "cid", "data"],
    transformTags: {
      a: (tagName, attribs) => ({
        tagName: "a",
        attribs: { ...attribs, target: "_blank", rel: "noopener noreferrer nofollow" },
      }),
    },
  });
}
