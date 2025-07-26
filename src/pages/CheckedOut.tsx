
import VisitorGrid from "../components/VisitorGrid";

export default function CheckedOut() {
  return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="bg-white rounded-lg shadow-lg border border-blue-100 p-10 max-w-3xl w-full">
        <h2 className="text-2xl font-bold text-blue-800 mb-6 text-center">Checked Out Today</h2>
        <VisitorGrid type="out" />
      </div>
    </div>
  );
}
