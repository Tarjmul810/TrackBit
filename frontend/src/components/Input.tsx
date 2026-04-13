

export default function Input({type, placeholder, name, setName}: { type: string, placeholder: string,  name: string, setName: React.Dispatch<React.SetStateAction<string>> }) {
    return (
        <input
            type={type}
            placeholder={placeholder}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-[#141414] text-white placeholder-[#888888] border border-[#ffffff15] rounded-lg px-4 py-3 focus:outline-none focus:border-[#3b3840]"
        />
    )
}