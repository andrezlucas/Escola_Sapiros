import ListaMateriais from "../components/ListMateriais";

function MateriaisAluno() {
  return (
    <div className="w-full h-auto p-4 sm:p-6 lg:p-8 bg-white rounded-xl shadow-md flex flex-col gap-4">
      <ListaMateriais />
    </div>
  );
}

export default MateriaisAluno;
