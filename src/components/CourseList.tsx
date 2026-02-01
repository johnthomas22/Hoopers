import type { Course } from '../types/course';

interface Props {
  courses: Course[];
  currentId: string;
  onLoad: (id: string) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export default function CourseList({ courses, currentId, onLoad, onDelete, onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-xl w-full max-w-md max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white">Saved Courses</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl">
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {courses.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">
              No saved courses yet. Design a course and tap Save!
            </p>
          ) : (
            courses.map((course) => (
              <div
                key={course.id}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                  course.id === currentId
                    ? 'bg-indigo-600/30 border border-indigo-500'
                    : 'bg-slate-700 hover:bg-slate-600 border border-transparent'
                }`}
                onClick={() => onLoad(course.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">{course.name}</div>
                  <div className="text-xs text-slate-400">
                    {course.equipment.length} obstacles &middot;{' '}
                    {course.ringWidth}×{course.ringHeight}m &middot;{' '}
                    {new Date(course.updatedAt).toLocaleDateString()}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(course.id);
                  }}
                  className="text-red-400 hover:text-red-300 text-sm px-2 py-1"
                >
                  🗑
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
