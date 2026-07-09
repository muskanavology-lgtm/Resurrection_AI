import CountUp from "react-countup";
export default function StatCard({
    title,
    value
}) {
    return (
        <div
            className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
            <h2 className="text-slate-400"> {title}
            </h2>

            <h1 className="text-5xl font-bold mt-3">
                <CountUp end={value} duration={2} />
            </h1>
        </div>
    );
}