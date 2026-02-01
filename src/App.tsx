import { useCourseDesigner } from './hooks/useCourseDesigner';
import RingCanvas from './components/RingCanvas';
import EquipmentPalette from './components/EquipmentPalette';
import Toolbar from './components/Toolbar';
import CourseList from './components/CourseList';

export default function App() {
  const designer = useCourseDesigner();

  return (
    <div className="h-dvh flex flex-col bg-slate-900 text-white select-none">
      {/* Top toolbar */}
      <Toolbar
        course={designer.course}
        selectedId={designer.selectedId}
        onSave={designer.save}
        onClear={designer.clearCourse}
        onRotate={designer.rotateEquipment}
        onRemove={designer.removeEquipment}
        onShowCourseList={() => designer.setShowCourseList(true)}
        onNew={designer.newCourse}
        onSetRingSize={designer.setRingSize}
        onRename={designer.renameCourse}
        onRenumber={designer.renumberEquipment}
        onUpdateEquipment={designer.updateEquipment}
      />

      {/* Canvas area */}
      <RingCanvas
        course={designer.course}
        selectedId={designer.selectedId}
        onSelect={designer.setSelectedId}
        onUpdateEquipment={designer.updateEquipment}
      />

      {/* Bottom equipment palette */}
      <div className="bg-slate-800 border-t border-slate-700 p-3">
        <EquipmentPalette onAdd={designer.addEquipment} />
      </div>

      {/* Course list modal */}
      {designer.showCourseList && (
        <CourseList
          courses={designer.savedCourses}
          currentId={designer.course.id}
          onLoad={designer.loadCourse}
          onDelete={designer.deleteCourse}
          onClose={() => designer.setShowCourseList(false)}
        />
      )}
    </div>
  );
}
