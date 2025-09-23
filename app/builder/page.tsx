export default function Builder() {
  return (
    <div className="h-screen w-full bg-zinc-950 flex flex-col items-center justify-center">

       {/* Navbar */}
       <div className="h-[7%] w-full border-b border-gray-700 flex items-center justify-end px-4">
         <button
          className="bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-600 transition-colors hover:cursor-pointer"
        >

        </button>
      </div>

      {/* Builder Area */}
      <div className="h-[93%] w-full flex px-2 py-3 gap-2">

        {/* Ai chat */}
        <div className="h-full w-[30%] border border-gray-700 rounded-xl">
          
        </div>

        {/* Code And Preview */}
        <div className="h-full w-[70%] flex border border-gray-700 rounded-xl overflow-hidden">
          
        </div>

      </div>

    </div>
  )
}
