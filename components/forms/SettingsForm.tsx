import FileIngestForm from "./FileIngestForm";

export default function SettingsForm() {
  return (
    <div className="min-h-screen flex flex-col">
        <form className="ml-100 flex-row mr-100 mt-50 p-10 bg-[#474242] rounded-4xl">
            <div className="text-[3rem] flex justify-center">
                Settings
            </div>
            <FileIngestForm />

        </form>
    </div>
  );
}