
"use client";

import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface FinancialData {
    date: string;
    revenue: number;
    cost: number;
    product: string;
}

interface FinancialChartProps {
    data: FinancialData[];
}

export function FinancialChart({ data }: FinancialChartProps) {
    // Sort data by date just in case
    const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return (
        <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={sortedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                    dataKey="date"
                    tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                />
                <YAxis />
                <Tooltip
                    formatter={(value: any) => [`฿${Number(value).toLocaleString()}`, "Amount"]}
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <Legend />
                <Area type="monotone" dataKey="revenue" stackId="1" stroke="#2563eb" fill="#3b82f6" name="Revenue" />
                <Area type="monotone" dataKey="cost" stackId="2" stroke="#dc2626" fill="#ef4444" name="Cost" />
            </AreaChart>
        </ResponsiveContainer>
    );
}
