export default function AnimatedBackground() {

    return (
        <>
            <div
                className="
   fixed
   top-[-300px]
   left-[-300px]
   w-[700px]
   h-[700px]
   bg-cyan-500/20
   blur-[200px]
   rounded-full
   "
            />

            <div
                className="
   fixed
   bottom-[-300px]
   right-[-300px]
   w-[700px]
   h-[700px]
   bg-purple-500/20
   blur-[200px]
   rounded-full
   "
            />
        </>
    );
}