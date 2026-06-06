type PhoneFrameProps = {
  title: string;
  src?: string;
  placeholder?: React.ReactNode;
};

// Visible inner screen size (frame width 340 minus p-2 padding on each side).
const SCREEN_WIDTH = 324;
const SCREEN_HEIGHT = 680;
// Logical viewport handed to the embedded app: a real phone width so its
// responsive layout (e.g. button rows) doesn't collapse/clip.
const DEVICE_WIDTH = 440;
const SCALE = SCREEN_WIDTH / DEVICE_WIDTH;
const DEVICE_HEIGHT = SCREEN_HEIGHT / SCALE;

export default function PhoneFrame({ title, src, placeholder }: PhoneFrameProps) {
  return (
    <div className="relative mx-auto" style={{ width: 340 }}>
      <div className="relative rounded-[2.4rem] border border-slate-300 bg-slate-900 p-2 shadow-[0_30px_60px_-20px_rgba(15,23,42,0.45)]">
        <div
          className="relative overflow-hidden rounded-[1.9rem] bg-white"
          style={{ height: SCREEN_HEIGHT }}
        >
          {src ? (
            <iframe
              src={src}
              title={title}
              loading="lazy"
              className="border-0"
              style={{
                width: DEVICE_WIDTH,
                height: DEVICE_HEIGHT,
                transform: `scale(${SCALE})`,
                transformOrigin: "top left",
              }}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-storage-access-by-user-activation"
              referrerPolicy="no-referrer-when-downgrade"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
              {placeholder}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
