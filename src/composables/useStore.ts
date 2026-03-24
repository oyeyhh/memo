import { ref, computed } from "vue";
import { useApi, type Group, type Note } from "./useApi";
import { move } from "@dnd-kit/helpers";

const api = useApi();

const groups = ref<Group[]>([]);
const notes = ref<Note[]>([]);
const isLoading = ref(false);
const isMutating = ref(false);
const error = ref<string | null>(null);

export function useStore() {
  const filterMode = ref<"all" | "todo" | "hide_done">("all");

  const ungroupedNotes = computed(() =>
    notes.value.filter((n) => {
      if (n.group_id !== null) return false;
      if (filterMode.value === "todo") return n.todo === 1;
      if (filterMode.value === "hide_done") return n.todo !== 2;
      return true;
    })
  );
  const todoCount = computed(() =>
    notes.value.filter((n) => n.todo === 1).length
  );
  const busy = computed(() => isLoading.value || isMutating.value);

  function getNotesForGroup(groupId: number) {
    return notes.value.filter((n) => {
      if (n.group_id !== groupId) return false;
      if (filterMode.value === "todo") return n.todo === 1;
      if (filterMode.value === "hide_done") return n.todo !== 2;
      return true;
    });
  }

  function replaceGroup(nextGroup: Group) {
    groups.value = groups.value.map((group) =>
      group.id === nextGroup.id ? nextGroup : group
    );
  }

  function replaceNote(nextNote: Note) {
    notes.value = notes.value.map((note) =>
      note.id === nextNote.id ? nextNote : note
    );
  }

  async function runWithState<T>(task: () => Promise<T>, kind: "loading" | "mutating") {
    error.value = null;
    if (kind === "loading") {
      isLoading.value = true;
    } else {
      isMutating.value = true;
    }

    try {
      return await task();
    } catch (err) {
      error.value = err instanceof Error ? err.message : "操作失败";
      throw err;
    } finally {
      if (kind === "loading") {
        isLoading.value = false;
      } else {
        isMutating.value = false;
      }
    }
  }

  async function loadData() {
    await runWithState(async () => {
      const [g, n] = await Promise.all([api.getAllGroups(), api.getAllNotes()]);
      groups.value = g;
      notes.value = n;
    }, "loading");
  }

  async function addNote(name: string, content: string, groupId: number | null, todo: number = 0) {
    await runWithState(async () => {
      const note = await api.createNote(name, content, groupId, todo);
      notes.value = [...notes.value, note];
    }, "mutating");
  }

  async function editNote(id: number, name: string, content: string, groupId: number | null, todo: number) {
    await runWithState(async () => {
      const note = await api.updateNote(id, name, content, groupId, todo);
      replaceNote(note);
    }, "mutating");
  }

  async function removeNote(id: number) {
    await runWithState(async () => {
      await api.deleteNote(id);
      notes.value = notes.value.filter((note) => note.id !== id);
    }, "mutating");
  }

  async function updateNotesOrder(noteIds: number[]) {
    await runWithState(async () => {
      await api.updateNotesOrder(noteIds);
    }, "mutating");
  }

  async function updateGroupsOrder(groupIds: number[]) {
    await runWithState(async () => {
      await api.updateGroupsOrder(groupIds);
    }, "mutating");
  }

  async function addGroup(name: string) {
    return runWithState(async () => {
      const group = await api.createGroup(name);
      groups.value = [...groups.value, group];
      return group;
    }, "mutating");
  }

  async function editGroup(id: number, name: string) {
    await runWithState(async () => {
      const group = await api.updateGroup(id, name);
      replaceGroup(group);
    }, "mutating");
  }

  async function removeGroup(id: number) {
    await runWithState(async () => {
      await api.deleteGroup(id);
      groups.value = groups.value.filter((group) => group.id !== id);
      notes.value = notes.value.filter((note) => note.group_id !== id);
    }, "mutating");
  }

  async function copyContent(content: string) {
    await runWithState(async () => {
      await api.copyToClipboard(content);
    }, "mutating");
  }

  async function reorderUngroupedNotes(event: any) {
    if (filterMode.value !== "all") return; // Disable reorder when filtered
    const reordered = move(ungroupedNotes.value, event);
    const otherNotes = notes.value.filter((note) => note.group_id !== null);
    notes.value = [...reordered, ...otherNotes];
    await updateNotesOrder(notes.value.map((note) => note.id));
  }

  async function reorderGroupNotes(groupId: number, event: any) {
    if (filterMode.value !== "all") return; // Disable reorder when filtered
    const groupedNotes = getNotesForGroup(groupId);
    const reordered = move(groupedNotes, event);
    const otherNotes = notes.value.filter((note) => note.group_id !== groupId);
    notes.value = [...otherNotes, ...reordered];
    await updateNotesOrder(notes.value.map((note) => note.id));
  }

  async function reorderGroups(event: any) {
    if (filterMode.value !== "all") return; // Disable reorder when filtered
    groups.value = move(groups.value, event);
    await updateGroupsOrder(groups.value.map((group) => group.id));
  }

  return {
    groups,
    notes,
    isLoading,
    isMutating,
    busy,
    error,
    filterMode,
    ungroupedNotes,
    todoCount,
    getNotesForGroup,
    loadData,
    addNote,
    editNote,
    removeNote,
    updateNotesOrder,
    addGroup,
    editGroup,
    removeGroup,
    updateGroupsOrder,
    copyContent,
    reorderUngroupedNotes,
    reorderGroupNotes,
    reorderGroups,
  };
}
