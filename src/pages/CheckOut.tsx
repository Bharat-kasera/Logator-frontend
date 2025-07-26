

// Demo static data for visitors currently checked in
const demoVisitors = [
  { id: 1, name: "John Doe", phone: "+91 9876543210", checkInTime: "10:00 AM" },
  { id: 2, name: "Jane Smith", phone: "+91 9123456780", checkInTime: "10:30 AM" },
];

export default function CheckOut() {
  return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="bg-white rounded-lg shadow-lg border border-blue-100 p-10 max-w-3xl w-full">
        <h2 className="text-2xl font-bold text-blue-800 mb-6 text-center">Check-Out Visitors</h2>
        <div className="flex flex-col">
          <div className="flex justify-between mb-4">
            <div className="w-1/3">Name</div>
            <div className="w-1/3">Phone</div>
            <div className="w-1/3">Check-In Time</div>
            <div className="w-1/3">Action</div>
          </div>
          {demoVisitors.map((visitor) => (
            <div key={visitor.id} className="flex justify-between mb-2 border-b">
              <div className="w-1/3">{visitor.name}</div>
              <div className="w-1/3">{visitor.phone}</div>
              <div className="w-1/3">{visitor.checkInTime}</div>
              <div className="w-1/3">
                <button
                  className="btn"
                  onClick={() => alert(`Checked out ${visitor.name} (stub)`)}
                >
                  Check Out
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
