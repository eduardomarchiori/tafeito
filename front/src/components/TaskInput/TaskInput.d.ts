import { Categoria, Tarefa } from '../../utils/model';

export type TaskInputProps = {
    // onSelectCreateTask: (category:string|null) => void;
    category: Categoria;
    task?: Tarefa;
    cancelTask: () => void;
    submitTask: () => void;
}