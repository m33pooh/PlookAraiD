
"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface YieldData {
    date: string;
    amount: number;
    product: string;
    unit: string;
}

interface YieldChartProps {
    data: YieldData[];
}

export function YieldChart({ data }: YieldChartProps) {
    return (
        <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                    dataKey="date"
                    tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                />
                <YAxis />
                <Tooltip
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                    formatter={(value: any) => [`${Number(value).toLocaleString()} kg`, "Harvested"]}
                />
                <Legend />
                <Bar dataKey="amount" fill="#16a34a" name="Yield (kg)" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
}
