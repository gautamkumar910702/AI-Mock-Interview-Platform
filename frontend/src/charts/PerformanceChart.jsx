import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function PerformanceChart({ data }) {

  return (

    <div className="chart-card">

      <h2>Performance Trend</h2>

      <ResponsiveContainer
        width="100%"
        height={350}
      >

        <LineChart
          data={data}
          margin={{
            top:20,
            right:30,
            left:10,
            bottom:10,
          }}
        >

          <CartesianGrid strokeDasharray="3 3" />

          <XAxis
            dataKey="interview"
          />

          <YAxis
            domain={[0,100]}
          />

          <Tooltip />
                    <Line
            type="monotone"
            dataKey="score"
            stroke="#2563eb"
            strokeWidth={3}
            dot={{
              r:5,
            }}
            activeDot={{
              r:8,
            }}
          />

        </LineChart>

      </ResponsiveContainer>

    </div>

  );

}

export default PerformanceChart;