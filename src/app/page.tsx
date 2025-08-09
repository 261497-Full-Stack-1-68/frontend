"use client"

import axios from "axios";
import { useEffect, useState } from "react";
import { TodoItem } from "./types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function Home() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [inputText, setInputText] = useState("");
  const [mode, setMode] = useState<"ADD" | "EDIT">("ADD");
  const [curTodoId, setCurTodoId] = useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editText, setEditText] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setIsLoading(true);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const res = await axios.get<TodoItem[]>("/api/todo", {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      setTodos(res.data);
    } catch (err) {
      if (axios.isAxiosError(err) && err.code === 'ECONNABORTED') {
        toast.error("Request timeout. Please try again.");
      } else {
        toast.error("Failed to fetch todos");
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInputText(e.target.value);
  }

  async function handleSubmit() {
    if (!inputText.trim()) return;

    try {
      if (mode === "ADD") {
        await axios.put("/api/todo", { todoText: inputText });
        toast.success("Todo added successfully");
      } else {
        await axios.patch("/api/todo", {
          id: curTodoId,
          todoText: inputText,
        });
        toast.success("Todo updated successfully");
        setMode("ADD");
        setCurTodoId("");
      }
      setInputText("");
      await fetchData();
    } catch (err) {
      toast.error("Submit failed");
      console.error(err);
    }
  }

  async function handleDelete(id: string) {
    try {
      await axios.delete("/api/todo", { data: { id } });
      setMode("ADD");
      setInputText("");
      await fetchData();
      toast.success("Todo deleted successfully");
    } catch (err) {
      toast.error("Delete failed");
      console.error(err);
    }
  }

  function handleEdit(item: TodoItem) {
    setMode("EDIT");
    setCurTodoId(item.id);
    setInputText(item.todoText);
    setEditText(item.todoText);
    setEditDialogOpen(true);
  }

  function handleEditInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setEditText(e.target.value);
  }

  async function handleEditSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!editText.trim()) return;
    try {
      await axios.patch("/api/todo", {
        id: curTodoId,
        todoText: editText,
      });
      setMode("ADD");
      setCurTodoId("");
      setInputText("");
      setEditDialogOpen(false);
      setEditText("");
      await fetchData();
      toast.success("Todo updated successfully");
    } catch (err) {
      toast.error("Edit failed");
      console.error(err);
    }
  }

  function handleCancel() {
    setMode("ADD");
    setInputText("");
    setCurTodoId("");
  }

  const compareDate = (a: TodoItem, b: TodoItem) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

  const formatDateTime = (isoString: string) => {
    const dateObj = new Date(isoString);
    const date = dateObj.toLocaleDateString();
    const time = dateObj.toLocaleTimeString();
    return { date, time };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center bg-background">
        <div className="container mt-8">
          <Card>
            <CardContent>
              <div className="flex justify-center items-center h-64">
                <div className="text-lg">Loading todos...</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex justify-center bg-background">
      <div className="container mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Todo App2</CardTitle>
            <CardDescription>Manage your todos efficiently</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                if (mode === "ADD") {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              className="w-full"
            >
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "start" }}>
                <Input
                  type="text"
                  onChange={handleChange}
                  value={inputText}
                  data-cy="input-text"
                  placeholder="Enter todo"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && mode === "ADD") {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                  disabled={mode === "EDIT"}
                />
                <Button
                  type="submit"
                  data-cy="submit"
                  disabled={mode === "EDIT"}
                >
                  {mode === "ADD" ? "Submit" : "Update"}
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="block">
            <div data-cy="todo-item-wrapper">
              <Table>
                <TableCaption>List of your todos</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Todo</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {todos.sort(compareDate).map((item, idx) => {
                    const { date, time } = formatDateTime(item.createdAt);
                    return (
                      <TableRow key={item.id}>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell>{date}</TableCell>
                        <TableCell>{time}</TableCell>
                        <TableCell data-cy="todo-item-text">{item.todoText}</TableCell>
                        <TableCell>
                          <div className="flex flex-col items-center gap-1">
                            <div className="text-xs text-muted-foreground mb-1">Actions:</div>
                            <div className="flex flex-row gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleEdit(item)}
                                data-cy="todo-item-update"
                              >
                                {curTodoId === item.id ? "✍🏻" : "🖊️"}
                              </Button>
                              {mode === "ADD" && (
                                <Button
                                  variant="destructive"
                                  size="icon"
                                  onClick={() => handleDelete(item.id)}
                                  data-cy="todo-item-delete"
                                >
                                  🗑️
                                </Button>
                              )}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardFooter>
        </Card>
      </div>
      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Todo</DialogTitle>
            <DialogDescription>Update your todo item below.</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={handleEditSubmit}
            className="flex flex-col gap-4"
          >
            <Input
              type="text"
              value={editText}
              onChange={handleEditInputChange}
              autoFocus
              data-cy="edit-input-text"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleEditSubmit(e);
                }
              }}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary" onClick={handleCancel}>
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" data-cy="edit-submit" disabled={!editText.trim()}>
                Update
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}