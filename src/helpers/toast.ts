import { Id, toast } from "react-toastify";

export const promiseOptions = {
  pending: "Cargando Registros...",
  success: {
    //"¡Registros obtenidos! 👌",
    render() {
      return null; // O simplemente return null;
    },
  },
  error: "Hubo un error. 🤯",
};

export const updateToast = (
  id: Id,
  type: "error" | "success" | "default",
  message: string,
) =>
  toast.update(id, {
    isLoading: false,
    type: type,
    render: message,
    autoClose: 3000,
  });
