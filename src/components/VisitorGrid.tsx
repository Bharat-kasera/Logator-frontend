import { useState } from "react";

interface Visitor {
  id: number;
  name: string;
  phone: string;
  check_in_at: string;
}

interface VisitorGridProps {
  type?: "in" | "out";
}

// Demo data for both checked-in and checked-out visitors
const demoVisitorsIn: Visitor[] = [
  { id: 1, name: "John Doe", phone: "+91 9876543210", check_in_at: "10:00 AM" },
  { id: 2, name: "Jane Smith", phone: "+91 9123456780", check_in_at: "10:30 AM" },
];

const demoVisitorsOut: Visitor[] = [
  { id: 3, name: "Bob Brown", phone: "+91 9999999999", check_in_at: "09:00 AM" },
];

export default function VisitorGrid({ type = "in" }: VisitorGridProps) {
  const [visitors, setVisitors] = useState<Visitor[]>(
    type === "in" ? demoVisitorsIn : demoVisitorsOut
  );

  const handleCheckout = (id: number) => {
    setVisitors(visitors.filter((v: Visitor) => v.id !== id));
    alert(`Checked out visitor with id ${id} (stub)`);
  };

  return (
    <table className="w-full mt-4 border border-gray-300 rounded overflow-hidden text-sm md:text-base">
      <thead>
        <tr className="bg-gray-200">
          <th>Name</th><th>Phone</th><th>InTime</th><th>Action</th>
        </tr>
      </thead>
      <tbody>
        {visitors.map((v: Visitor) => (
          <tr key={v.id}>
            <td>{v.name}</td>
            <td>{v.phone}</td>
            <td>{v.check_in_at}</td>
            <td>
              {type === "in" && (
                <button 
                  onClick={() => handleCheckout(v.id)}
                  className="px-3 py-1 bg-red-500 text-white rounded-xl">
                  Check Out
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
