import { Chart, useChart } from "@chakra-ui/charts";
import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts"

export default function StockChart({ history }) {

    // Process history
    const stockHistory = history.map(s => {
        const date = s.date.split("T")[0];

        return {
            date,
            price: s.close
        };
    });

    const chart = useChart({
        data: stockHistory,
        series: [{ name: "price", color: "teal.400" }]
    });

    return(
        <Chart.Root chart={chart} maxH="xl" w="75%" m="auto" pb={24} minW={96} pt={12} fontSize="md" >
            <LineChart data={chart.data}>
                <CartesianGrid stroke={chart.color("border")} vertical={false} />
                <XAxis 
                    dataKey={chart.key("date")}
                    stroke={chart.color("border")}
                    axisLine={false}
                    tickMargin={32}
                    padding={{ left: 15, right: 15 }}
                    angle={-20}
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
                    domain={[chart.getMin("price") * 0.95, chart.getMax("price") * 1.01]}
                />
                <Tooltip
                    animationDuration={100}
                    cursor={false}
                    content={<Chart.Tooltip />}
                />
                <Line
                    dataKey={chart.key("price")}
                    stroke={chart.color("teal.400")}
                    strokeWidth={1.5}
                    dot={false}
                    animationDuration={1000}
                    type="linear"
                />
            </LineChart>
        </Chart.Root>
    );
}