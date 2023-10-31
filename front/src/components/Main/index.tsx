import { Box, Button, Typography } from "@mui/material";
import TaskInputWrapper from "../TaskInputWrapper";

import { CustomizedSectionBox } from "./styles";
import { useEffect, useState } from "react";
import { api } from "../../provider/customAxios";

import { url_categorias } from "../../utils/api";
import { Categoria, Tarefa } from "../../utils/model";
import TaskList from "../TaskList";

import { MainProps } from "./Main";
import { useGlobalContext } from "../../utils/global";
import ProjectTasks from "../ProjectTasks";

const Main = (props: MainProps) => {
  const { categorias } = props;

  const {
    isEditingTask,
    selectedTaskInput,
    refetchTaskStatus
  } = useGlobalContext();

  const renderCategoriaSection = (categoria_item: Categoria) => {
    // const showTaskInput = isEditingTask === false && (selectedTaskInput === null || selectedTaskInput === categoria_item.descricao);
    const showTaskInput = 
      isEditingTask === false && (selectedTaskInput === null || selectedTaskInput === categoria_item.descricao);
    return (
      <CustomizedSectionBox key={categoria_item.id} pt={2} pb={1}>
        <Typography variant="h2" sx={{
          fontSize: '2rem',
          marginBottom: '8px'
        }}> 
        {" "}
        {categoria_item.descricao} 
        </Typography>

        <TaskList categoria = {categoria_item} taskStatus = {refetchTaskStatus} />

        {showTaskInput ? <TaskInputWrapper category={categoria_item} /> : null} 
      </CustomizedSectionBox>
    );
  };

  return (
    <Box
      display="flex"
      flexWrap={"wrap"}
      sx={{
        textAlign: "center",
        maxWidth: "720px",
        margin: "0 auto",
      }}
    >
      <CustomizedSectionBox>
        <Typography variant="h1" sx={{
          fontSize: '3rem'
        }}> 
          {" "}
          Suas tarefas{" "}
        </Typography>
        <ProjectTasks categories={categorias} />
      </CustomizedSectionBox>
      {categorias.map((categoria) => renderCategoriaSection(categoria))}
    </Box>
  );
};

const MainWrapper = () => {
  const [categorias, setCategorias] = useState<null | Categoria[]>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // useEffect(() => {
  //   axios.get(url_categorias).then((response) => {
  //     console.log("xxx", response.data);
  const fetchCategories = async () => {
    try {
      const response = await api.get(url_categorias);
      setCategorias(response.data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Ocorreu um erro inexperado.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  if (categorias) {
    return <Main categorias={categorias} />;
  }

  return <div>Loading!!</div>;
};

export default MainWrapper;