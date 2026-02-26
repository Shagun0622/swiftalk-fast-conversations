interface Props {
  isOnline: boolean;
  isActive?: boolean;
}

export default function OnlineDot({ isOnline, isActive }: Props) {
  if (!isOnline) return null;
  return (
    <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2
      ${isActive ? "border-indigo-600" : "border-slate-950"} bg-green-500`} />
  );
}
