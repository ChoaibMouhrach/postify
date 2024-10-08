"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface OrdersChartProps {
  data: {
    count: number;
    month: number;
  }[];
}

export const Chart: React.FC<OrdersChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer
      width="100%"
      height={400}
      className="border rounded-md"
    >
      <AreaChart
        width={500}
        height={400}
        data={data}
        margin={{ left: 0, right: 0, top: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis dataKey="count" width={40} />
        <Tooltip />
        <Area type="monotone" dataKey="count" stroke="#8884d8" fill="#8884d8" />
      </AreaChart>
    </ResponsiveContainer>
  );
};
