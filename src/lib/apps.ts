import { asset } from "@/lib/asset";

export type AppStatus = "produccion" | "diseno" | "pendiente";

export type AppDefinition = {
  slug: string;
  index: string;
  name: string;
  tagline: string;
  status: AppStatus;
  description: string;
  features: { title: string; detail: string }[];
  embedUrl?: string;
  cardImage?: string;
  hidden?: boolean;
  /** Ruta nativa dentro del portal (módulos no embebidos por iframe, ej. Buzón). */
  route?: string;
};

export const apps: AppDefinition[] = [
  {
    slug: "correos",
    index: "01",
    name: "Correos",
    tagline: "Gestión y trazabilidad de correspondencia interna.",
    status: "pendiente",
    hidden: true,
    description:
      "Aplicación móvil para el registro, seguimiento y entrega de correspondencia y paquetería interna. Pendiente de definición de alcance y URL de despliegue.",
    features: [
      {
        title: "Registro de entradas",
        detail:
          "Captura de remitente, destinatario, fecha y evidencia fotográfica del envío recibido.",
      },
      {
        title: "Entrega con firma",
        detail:
          "Confirmación de entrega con firma del destinatario y sello con fecha y hora.",
      },
      {
        title: "Trazabilidad",
        detail:
          "Historial completo del recorrido de cada envío dentro de la organización.",
      },
    ],
  },
  {
    slug: "checklist",
    index: "02",
    name: "Checklist",
    tagline: "Inspección vehicular digital para flotillas multi-marca.",
    status: "produccion",
    description:
      "Aplicación móvil para que operadores e inspectores realicen el checklist diario de una unidad: estado mecánico, documentación, llantas, niveles, evidencias fotográficas y firma del responsable. Diseñada como producto multi-marca, soporta personalización por cliente sin duplicar la base de código.",
    features: [
      {
        title: "Inspección guiada por categorías",
        detail:
          "Formularios configurables por tipo de unidad con captura de fotos, observaciones y nivel de severidad.",
      },
      {
        title: "Lectura de códigos QR y de barras",
        detail:
          "Identificación rápida de unidades, operadores y activos mediante el escáner integrado.",
      },
      {
        title: "Firma digital del responsable",
        detail:
          "Captura de firma manuscrita en pantalla y sello con fecha, hora y geolocalización del cierre de inspección.",
      },
      {
        title: "Operación offline con sincronización",
        detail:
          "El operador puede capturar sin red; los datos se sincronizan cuando hay conexión disponible.",
      },
      {
        title: "Tematización por cliente",
        detail:
          "Paleta, logotipo y configuración por marca (ej. Danone, GPFleet) gestionados con ramas dedicadas y CI/CD propio.",
      },
    ],
    embedUrl: "https://astounding-sopapillas-b99b4f.netlify.app/",
    cardImage: asset("/background-checklist-card.jpg"),
  },
  {
    slug: "neumaticos",
    index: "03",
    name: "Neumáticos",
    tagline: "Gestión del ciclo de vida del neumático en flotilla.",
    status: "produccion",
    description:
      "Aplicación móvil para el control integral del neumático: alta del activo, asignación a unidades y posiciones, registro de rotaciones, mediciones de profundidad y presión, historial de eventos y baja por desgaste o daño. Diseñada para integrarse con Checklist y compartir el padrón de unidades.",
    features: [
      {
        title: "Padrón de neumáticos",
        detail:
          "Alta y trazabilidad por número de serie, marca, modelo, medida y costo de adquisición.",
      },
      {
        title: "Asignación a unidad y posición",
        detail:
          "Mapa de posiciones por tipo de unidad (tracto, remolque, ligero) con histórico de movimientos.",
      },
      {
        title: "Mediciones periódicas",
        detail:
          "Captura de profundidad de rodamiento y presión, con alertas por umbrales configurables.",
      },
      {
        title: "Rotaciones y reencauche",
        detail:
          "Registro de operaciones de rotación, reparación y reencauche con su costo asociado.",
      },
      {
        title: "Integración con Checklist",
        detail:
          "Compartirá el padrón de unidades y los hallazgos de llantas detectados durante la inspección diaria.",
      },
    ],
    embedUrl: "https://phenomenal-dodol-58babd.netlify.app/",
    cardImage: asset("/background-neumaticos-card.jpg"),
  },
  {
    slug: "buzon",
    index: "01",
    name: "Buzón",
    tagline: "Bandeja de entrada simulada de la sesión demo.",
    status: "produccion",
    route: "/apps/buzon",
    description:
      "Bandeja de entrada simulada que muestra, por sesión demo, los correos generados por los flujos de la plataforma (cotizaciones, mantenimiento, reportes). Cada usuario ve únicamente sus propios correos, organizados por proceso de negocio.",
    features: [
      {
        title: "Correos por sesión",
        detail:
          "Cada usuario demo ve solo los correos generados por su actividad, aislados del resto.",
      },
      {
        title: "Carpetas por flujo",
        detail:
          "Refacciones/Compras, Mantenimiento Externo, Reporte de bajas y Otros.",
      },
      {
        title: "Lectura completa",
        detail:
          "Vista de bandeja con lista y panel de lectura del correo seleccionado.",
      },
    ],
  },
];

export function getApp(slug: string): AppDefinition | undefined {
  return apps.find((a) => a.slug === slug);
}

export const statusStyles: Record<
  AppStatus,
  { label: string; className: string }
> = {
  produccion: {
    label: "En producción",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  },
  diseno: {
    label: "En diseño",
    className: "bg-amber-50 text-amber-800 ring-amber-200",
  },
  pendiente: {
    label: "Próximamente",
    className: "bg-slate-100 text-slate-600 ring-slate-200",
  },
};
