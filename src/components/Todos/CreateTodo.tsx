import { Transition, Dialog } from "@headlessui/react";
import dayjs from "dayjs";
import { Field, Form, Formik } from "formik";
import { Fragment, useState } from "react";
import { z } from "zod";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { trpc } from "../../utils/api";

const schema = z.object({
  name: z.string(),
  desc: z.string().optional(),
  dueDate: z
    .date()
    .min(new Date(), "Cannot set a due date in the past")
    .optional(),
});
type FormSchemaType = z.infer<typeof schema>;
type Props = {
  refetchTodo: () => void;
};

export const CreateTodo: React.FC<Props> = ({ refetchTodo }) => {
  const [isOpen, setOpen] = useState(false);
  const createTodo = trpc.todo.createTodo.useMutation();

  const handleSubmit = async ({ name, desc, dueDate }: FormSchemaType) => {
    await createTodo.mutateAsync({ name, desc, dueDate });
    refetchTodo();
    setOpen(false);
  };
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        tabIndex={0}
        className="mb-8 w-full cursor-pointer rounded-md bg-green-300  py-2 px-4 font-medium text-slate-800 hover:bg-green-400 focus:bg-green-300/80 focus:outline focus:outline-2 focus:outline-green-500"
      >
        create new todo
      </button>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setOpen(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Create New Todo
                  </Dialog.Title>
                  <div className="mt-2">
                    <Formik
                      initialValues={{
                        name: "",
                        desc: undefined,
                        dueDate: undefined,
                      }}
                      validationSchema={toFormikValidationSchema(schema)}
                      onSubmit={handleSubmit}
                    >
                      {({ errors, setFieldValue }) => (
                        <Form className="flex flex-col gap-4">
                          <div className="flex flex-col">
                            <label className="text-sm text-gray-500">
                              Task Name
                            </label>
                            <Field
                              name="name"
                              className="rounded-lg bg-gray-100 p-2"
                            ></Field>
                            <label className="text-sm text-red-400">
                              {errors.name}
                            </label>
                          </div>
                          <div className="flex flex-col">
                            <label className="text-sm text-gray-500">
                              Description (optional)
                            </label>
                            <Field
                              name="desc"
                              className="rounded-lg bg-gray-100 p-2"
                            ></Field>
                            <label className="text-sm text-red-400">
                              {errors.desc}
                            </label>
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-sm text-gray-500">
                              Due Date (optional)
                            </label>
                            <input
                              type="date"
                              onChange={(e) => {
                                setFieldValue(
                                  "dueDate",
                                  dayjs(e.target.value).endOf("day").toDate(),
                                  true
                                );
                              }}
                              className="rounded-lg bg-gray-100 p-2"
                            ></input>
                            <label className="text-sm text-red-400">
                              {errors.dueDate}
                            </label>
                          </div>
                          <div className="mt-4">
                            <button
                              tabIndex={0}
                              type="submit"
                              className="w-full cursor-pointer rounded-md bg-green-300  py-2 px-4 font-medium text-slate-800 hover:bg-green-400 focus:bg-green-300/80 focus:outline focus:outline-2 focus:outline-green-500"
                            >
                              create
                            </button>
                          </div>
                        </Form>
                      )}
                    </Formik>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};
