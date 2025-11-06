import FileIngestForm from "@/components/settings/FileIngestForm";
import FileListComponent from "@/components/settings/FileListComponent";
import { getFilesNames } from "@/lib/api/files.request";


export default async function Settings() {

    const filesNames = await getFilesNames();

    return (
    <div className="min-h-screen flex flex-col">
        <div className="ml-100 flex-row mr-100 mt-50 p-10 bg-[#474242] rounded-4xl">
            <div className="text-[3rem] flex justify-center">
                Settings
            </div>
            <FileListComponent filesnames={ filesNames } />
            <FileIngestForm />

        </div>
    </div>
    );
}