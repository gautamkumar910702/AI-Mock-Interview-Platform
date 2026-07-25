import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

const COLORS = [
  "#2563eb",
  "#16a34a",
  "#f97316",
  "#9333ea",
  "#eab308",
  "#ef4444",
];

function CategoryChart({ data }) {
  return (
    <div className="chart-card">
      <h2>Category Wise Interviews</h2>

      <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={120}
            innerRadius={60}
            dataKey="value"
            nameKey="name"
            label
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>

          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default CategoryChart;