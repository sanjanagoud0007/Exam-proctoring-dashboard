import { useMemo, useState } from "react";
import { FiSearch, FiCheckSquare, FiSquare } from "react-icons/fi";

/**
 * Checkbox list for assigning exams to multiple students.
 */
const StudentMultiSelect = ({
  students = [],
  selectedIds = [],
  onChange,
  emptyMessage = "No students available.",
}) => {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) =>
        s.name?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q)
    );
  }, [students, search]);

  const allFilteredSelected =
    filtered.length > 0 &&
    filtered.every((s) => selectedIds.includes(s._id));

  const toggle = (id) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((x) => x !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const selectAllFiltered = () => {
    const ids = filtered.map((s) => s._id);
    onChange([...new Set([...selectedIds, ...ids])]);
  };

  const clearAll = () => onChange([]);

  if (students.length === 0) {
    return (
      <p className="text-sm text-amber-400 py-2">{emptyMessage}</p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent pl-10 pr-4 py-2.5 text-sm"
          />
        </div>
        <button
          type="button"
          onClick={allFilteredSelected ? clearAll : selectAllFiltered}
          className="text-xs font-semibold text-indigo-500 hover:underline px-2"
        >
          {allFilteredSelected ? "Clear all" : "Select all"}
        </button>
        {selectedIds.length > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="text-xs text-slate-500 hover:text-red-400 px-2"
          >
            Deselect ({selectedIds.length})
          </button>
        )}
      </div>

      <p className="text-xs text-slate-500">
        {selectedIds.length === 0
          ? "Click students to select one or more."
          : `${selectedIds.length} student(s) selected`}
      </p>

      <ul className="max-h-56 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-700 divide-y divide-slate-200/50 dark:divide-slate-700/50">
        {filtered.length === 0 ? (
          <li className="p-4 text-sm text-slate-500">No matches.</li>
        ) : (
          filtered.map((s) => {
            const checked = selectedIds.includes(s._id);
            return (
              <li key={s._id}>
                <label className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-800/50">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(s._id)}
                    className="h-4 w-4 rounded border-slate-400 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-medium text-slate-800 dark:text-slate-100 truncate">
                      {s.name}
                    </span>
                    <span className="block text-xs text-slate-500 truncate">
                      {s.email}
                      {!s.approved ? " · pending approval" : ""}
                    </span>
                  </span>
                  {checked ? (
                    <FiCheckSquare className="text-indigo-500 shrink-0" />
                  ) : (
                    <FiSquare className="text-slate-400 shrink-0" />
                  )}
                </label>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
};

export default StudentMultiSelect;
