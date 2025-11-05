import { Heading } from "@chakra-ui/react";

export default function SortTag({ name, sortMetrics, setSortAscending, icon, w}) {
    const [sortMetric, setSortMetric] = sortMetrics;

    return(
        <Heading
            onClick={() => {
                // Sort descending by default, flip if this sorting metric is already selected
                sortMetric === name ? setSortAscending(prev => !prev) : setSortAscending(false);
                setSortMetric(name);
            }}
            userSelect="none"
            color={sortMetric === name ? "teal.400" : null}
            _hover={{ cursor: "button" }}
            fontSize={["2xs", "xs", "sm", "md", "lg"]}
            w={w}
        >
            {name} {sortMetric === name ? icon : null}
        </Heading>
    );
}