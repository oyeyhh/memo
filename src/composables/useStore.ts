import { ref, computed } from "vue";
import { useApi, type Group, type Note } from "./useApi";

const api = useApi();

const groups = ref<Group[]>([]);
const notes = ref<Note[]>([]);

export function useStore() {
  const ungroupedNotes = computed(() =>
    notes.value.filter((n) => n.group_id === null)
  );

  function getNotesForGroup(groupId: number) {
    return notes.value.filter((n) => n.group_id === groupId);
  }

  async function loadData() {
    const [g, n] = await Promise.all([api.getAllGroups(), api.getAllNotes()]);
    groups.value = g;
    notes.value = n;
  }

  async function addNote(name: string, content: string, groupId: number | null) {
    await api.createNote(name, content, groupId);
    await loadData();
  }

  async function editNote(id: number, name: string, content: string, groupId: number | null) {
    await api.updateNote(id, name, content, groupId);
    await loadData();
  }

  async function removeNote(id: number) {
    await api.deleteNote(id);
    await loadData();
  }

  async function addGroup(name: string) {
    const group = await api.createGroup(name);
    await loadData();
    return group;
  }

  async function editGroup(id: number, name: string) {
    await api.updateGroup(id, name);
    await loadData();
  }

  async function removeGroup(id: number) {
    await api.deleteGroup(id);
    await loadData();
  }

  async function copyContent(content: string) {
    await api.copyToClipboard(content);
  }

  return {
    groups,
    notes,
    ungroupedNotes,
    getNotesForGroup,
    loadData,
    addNote,
    editNote,
    removeNote,
    addGroup,
    editGroup,
    removeGroup,
    copyContent,
  };
}
