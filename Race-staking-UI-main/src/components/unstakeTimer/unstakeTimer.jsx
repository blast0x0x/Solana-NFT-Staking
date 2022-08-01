import { useEffect, useState } from "react";
import { prettyVestingPeriod2 } from "src/helpers";

function UnstakeTimer({ unstakeTime }) {
    const [baseTime, setBaseTime] = useState(0);
    const [remainTimeStr, setRemainTimeStr] = useState("");

    useEffect(() => {
        setBaseTime(unstakeTime);
    }, [unstakeTime]);

    useEffect(() => {
        let interval = null;
        interval = setInterval(() => {
            setRemainTimeStr(prettyVestingPeriod2(baseTime));
        }, 1000);

        return () => clearInterval(interval);
    }, [baseTime]);
    return (
        <div>
            {remainTimeStr}
        </div>
    );
}

export default UnstakeTimer;