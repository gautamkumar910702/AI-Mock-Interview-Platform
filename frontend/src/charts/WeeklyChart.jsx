import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

function WeeklyChart({ data }) {

  return (

    <div className="chart-card">

      <h2>Weekly Interviews</h2>

      <ResponsiveContainer
        width="100%"
        height={350}
      >

        <BarChart
          data={data}
          margin={{
            top:20,
            right:30,
            left:10,
            bottom:10,
          }}
        >

          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="day" />

          <YAxis />

          <Tooltip />
                    <Bar
            dataKey="count"
            fill="#2563eb"
            radius={[8, 8, 0, 0]}
          />

        </BarChart>

      </ResponsiveContainer>

    </div>

  );

}

export default WeeklyChart;