import { ref, computed } from "vue";
import { useApi, type Group, type Note } from "./useApi";

const api = useApi();

const groups = ref<Group[]>([]);
const notes = ref<Note[]>([]);
const searchQuery = ref("");

export function useStore() {
  const ungroupedNotes = computed(() =>
    notes.value.filter((n) => n.group_id === null)
  );

  const filteredUngroupedNotes = computed(() => {
    const q = searchQuery.value.toLowerCase().trim();
    if (!q) return ungroupedNotes.value;
    return ungroupedNotes.value.filter((n) =>
      n.name.toLowerCase().includes(q)
    );
  });

  const filteredGroups = computed(() => {
    const q = searchQuery.value.toLowerCase().trim();
    if (!q) return groups.value;
    return groups.value.filter((g) => {
      const groupMatch = g.name.toLowerCase().includes(q);
      const hasMatchingNote = notes.value.some(
        (n) => n.group_id === g.id && n.name.toLowerCase().includes(q)
      );
      return groupMatch || hasMatchingNote;
    });
  });

  function getNotesForGroup(groupId: number) {
    const q = searchQuery.value.toLowerCase().trim();
    const groupNotes = notes.value.filter((n) => n.group_id === groupId);
    if (!q) return groupNotes;
    const groupMatch = groups.value.find((g) => g.id === groupId);
    if (groupMatch && groupMatch.name.toLowerCase().includes(q)) {
      return groupNotes;
    }
    return groupNotes.filter((n) => n.name.toLowerCase().includes(q));
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
    searchQuery,
    filteredUngroupedNotes,
    filteredGroups,
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
