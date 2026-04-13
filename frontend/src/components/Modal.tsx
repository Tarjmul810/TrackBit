import Input from "./Input"

export const Modal = (props: { name: string, setName: React.Dispatch<React.SetStateAction<string>>, handleOpen: () => void, onClick: () => void }) => {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-[#1a1a1a] border border-[#ffffff10] rounded-xl p-6 w-full max-w-sm flex flex-col gap-4">
                <h1 className="text-center text-2xl font-semibold italic">New Workspace</h1>
                <Input type="text" name={props.name} setName={props.setName} />

                <div className="flex justify-between gap-4">
                    <button className="w-48 text-white bg-gray-800 px-3 py-2 rounded-lg cursor-pointer transition-colors text-sm" onClick={props.handleOpen}>
                        Cancel
                    </button>
                    <button className="w-48 text-white bg-[#9865f0] hover:bg-[#a281f5] px-3 py-2 rounded-lg cursor-pointer transition-colors text-sm" onClick={props.onClick}>
                        {}
                    </button>
                </div>
            </div>
        </div>
    )
}