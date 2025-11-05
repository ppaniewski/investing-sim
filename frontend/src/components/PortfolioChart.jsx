import { Chart, useChart } from "@chakra-ui/charts"
import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts"
import { Heading } from "@chakra-ui/react";

export default function PortfolioChart({ snapshots }) {
    const placeholderSnapshot = {
        createdAt: new Date().toISOString(),
        totalValue: 100000
    };
    if (snapshots.length < 2) {
        snapshots.push(placeholderSnapshot);
    }

    // Process snapshots
    const snapshotData = snapshots.map(snapshot => {
        const parts = snapshot.createdAt.split("T");
        const dateString = `${parts[0]} (${parts[1].split(":")[0]}:${parts[1].split(":")[1]})`; 

        return {
            date: dateString,
            value: Math.floor(snapshot.totalValue)
        };
    });

    const chart = useChart({
        data: snapshotData,
        series: [{ name: "value", color: "teal.400" }]
    })

    return(
        <>
            <Heading textAlign="center" pt={8} color="teal.400" size="xl">Portfolio Value</Heading>
            <Chart.Root chart={chart} maxH="xl" w="80%" m="auto" pb={24} minW={96} fontSize="md">
                <LineChart data={chart.data}>
                    <CartesianGrid stroke={chart.color("border")} vertical={false} />
                    <XAxis 
                        dataKey={chart.key("date")}
                        stroke={chart.color("border")}
                        axisLine={false}
                        tickFormatter={(value) => value.split(" ")[0]}
                        tickMargin={28}
                        padding={{ left: 15, right: 15 }}
                        angle={-30}
                    />
                    <YAxis
                        stroke={chart.color("border")}
                        axisLine={false}
                        tickLine={false}
                        tickMargin={16}
                        angle={-30}
                        tickFormatter={chart.formatNumber({
                            style: "currency",
                            currency: "USD",
                            notation: "compact"
                        })}
                        domain={[floorThousand(chart.getMin("value") * 0.99), ceilThousand(chart.getMax("value") * 1.01)]}
                    />
                    <Tooltip
                        animationDuration={100}
                        cursor={false}
                        content={<Chart.Tooltip />}
                    />
                    <Line
                        dataKey={chart.key("value")}
                        stroke={chart.color("teal.400")}
                        strokeWidth={2}
                        dot={false}
                        animationDuration={1000}
                        type="linear"
                    />
                </LineChart>
            </Chart.Root>
        </>
    );
}

function floorThousand(value) {
    return Math.floor(value / 2000) * 2000;
}

function ceilThousand(value) {
    return Math.ceil(value / 2000) * 2000;
}
