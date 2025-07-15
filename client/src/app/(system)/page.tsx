"use client";
import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { Card, CardContent, Typography } from "@mui/material";
import { ArrowUpward, ArrowDownward } from "@mui/icons-material";

const sessionsData = [
  { date: "Apr 1", sessions: 1000 },
  { date: "Apr 5", sessions: 3000 },
  { date: "Apr 10", sessions: 7000 },
  { date: "Apr 15", sessions: 11000 },
  { date: "Apr 20", sessions: 15000 },
  { date: "Apr 25", sessions: 19000 },
  { date: "Apr 30", sessions: 23000 },
];

const viewsData = [
  { month: "Jan", views: 10000 },
  { month: "Feb", views: 9500 },
  { month: "Mar", views: 9800 },
  { month: "Apr", views: 12000 },
  { month: "May", views: 13500 },
  { month: "Jun", views: 10500 },
  { month: "Jul", views: 9500 },
];

const conversionsData = [
  { day: "Apr 1", count: 50 },
  { day: "Apr 5", count: 45 },
  { day: "Apr 10", count: 40 },
  { day: "Apr 15", count: 30 },
  { day: "Apr 20", count: 25 },
  { day: "Apr 25", count: 20 },
  { day: "Apr 30", count: 15 },
];

const kpis = [
  {
    label: "Users",
    value: "14k",
    change: "+25%",
    direction: "up",
    color: "text-green-400",
    background: "bg-green-400/20",
  },
  {
    label: "Conversions",
    value: "325",
    change: "-25%",
    direction: "down",
    color: "text-red-400",
    background: "bg-red-400/20",
  },
  {
    label: "Event count",
    value: "200k",
    change: "+5%",
    direction: "up",
    color: "text-blue-400",
    background: "bg-blue-400/20",
  },
];

const darkTooltip = {
  contentStyle: {
    backgroundColor: "#1f2937",
    border: "1px solid #4b5563",
    borderRadius: "8px",
    color: "#e5e7eb",
    fontSize: "14px",
  },
  itemStyle: {
    color: "#d1d5db",
  },
};

const darkLegend = {
  wrapperStyle: {
    color: "#d1d5db",
  },
};

export default function Home() {
  return (
    <div className="p-6 space-y-5 bg-[#0f0f0f] min-h-screen">
      <h1 className="text-2xl font-bold text-white">Dashboard</h1>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="!bg-primary-900 !text-white shadow-md">
            <CardContent>
              <Typography variant="subtitle2" className="!text-gray-200 font-semibold! ">
                {kpi.label}
              </Typography>
              <div className="flex items-center justify-between mt-1">
                <Typography variant="h5" className="!text-white">
                  {kpi.value}
                </Typography>
                <div className={`flex items-center ${kpi.background} rounded-3xl p-1 text-sm ${kpi.color}`}>
                  {kpi.direction === "up" ? (
                    <ArrowUpward fontSize="small" />
                  ) : (
                    <ArrowDownward fontSize="small" />
                  )}
                  <span className="ml-1">{kpi.change}</span>
                </div>
              </div>
              <Typography variant="caption" className="!text-gray-500">
                Last 30 days
              </Typography>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Sessions Chart */}
        <div className="bg-primary-900 rounded-xl p-4 shadow-md">
          <Typography variant="h6" className="!text-white mb-4">
            Sessions (últimos 30 días)
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={sessionsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="date" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip {...darkTooltip} />
              <Line
                type="monotone"
                dataKey="sessions"
                stroke="#60a5fa"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Conversions Chart */}
        <div className="bg-primary-900 rounded-xl p-4 shadow-md">
          <Typography variant="h6" className="!text-white mb-4">
            Conversions (últimos 30 días)
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={conversionsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="day" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip {...darkTooltip} />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#f87171"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Page Views Chart */}
      <div className="bg-primary-900 rounded-xl p-4 shadow-md">
        <Typography variant="h6" className="!text-white mb-4">
          Page Views y Descargas (últimos 6 meses)
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={viewsData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="month" stroke="#888" />
            <YAxis stroke="#888" />
            <Tooltip {...darkTooltip} />
            <Legend {...darkLegend} />
            <Bar dataKey="views" fill="#4f46e5" barSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
