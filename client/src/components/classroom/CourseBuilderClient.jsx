"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Folder, FileText, Settings, GripVertical, Eye, Trash2, Loader2 } from "lucide-react";
import { Button, Card, IconButton, Input } from "@/components/ui";
import CourseSettingsModal from "./CourseSettingsModal";
import LessonEditorModal from "./LessonEditorModal";
import { createModule, deleteModule, createLesson, deleteLesson, updateCourse, fetchCourse } from "@/lib/api";
import { useSocketStore } from "@/store/useSocketStore";

export default function CourseBuilderClient({ course: initialCourse, slug }) {
  const router = useRouter();
  const [course, setCourse] = useState(initialCourse);
  const [modules, setModules] = useState(initialCourse.modules || []);
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [addingModule, setAddingModule] = useState(false);
  const [savingModule, setSavingModule] = useState(false);
  const [addingLessonTo, setAddingLessonTo] = useState(null); // moduleId
  const [savingLesson, setSavingLesson] = useState(false);
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null); // { moduleId, lesson }
  const [error, setError] = useState(null);

  useEffect(() => {
    const { socket, isConnected } = useSocketStore.getState();
    if (!socket || !isConnected) return;

    const onCourseChange = (payload) => {
      // payload might have courseId or course object
      const targetId = payload?.courseId || payload?.course?.id;
      if (targetId && targetId !== course.id) return;
      
      fetchCourse(slug, course.slug).then((refreshed) => {
        setCourse(refreshed);
        setModules(refreshed.modules || []);
      }).catch(console.error);
    };

    socket.on('course:updated', onCourseChange);

    return () => {
      socket.off('course:updated', onCourseChange);
    };
  }, [slug, course.id, course.slug]);

  const handleAddModule = async (e) => {
    e.preventDefault();
    if (!newModuleTitle.trim()) return;
    setSavingModule(true);
    setError(null);
    try {
      const newMod = await createModule(slug, course.id, { title: newModuleTitle.trim() });
      setModules((prev) => [...prev, { ...newMod, lessons: [] }]);
      setNewModuleTitle("");
      setAddingModule(false);
    } catch (err) {
      setError(err.message || "Failed to create module.");
    } finally {
      setSavingModule(false);
    }
  };

  const handleDeleteModule = async (moduleId) => {
    if (!window.confirm("Delete this module and all its lessons?")) return;
    setError(null);
    try {
      await deleteModule(slug, moduleId);
      setModules((prev) => prev.filter((m) => m.id !== moduleId));
    } catch (err) {
      setError(err.message || "Failed to delete module.");
    }
  };

  const handleAddLesson = async (e, moduleId) => {
    e.preventDefault();
    if (!newLessonTitle.trim()) return;
    setSavingLesson(true);
    setError(null);
    try {
      const newLesson = await createLesson(slug, moduleId, { title: newLessonTitle.trim() });
      setModules((prev) => prev.map((mod) => {
        if (mod.id !== moduleId) return mod;
        return { ...mod, lessons: [...mod.lessons, newLesson] };
      }));
      setNewLessonTitle("");
      setAddingLessonTo(null);
    } catch (err) {
      setError(err.message || "Failed to create lesson.");
    } finally {
      setSavingLesson(false);
    }
  };

  const handleDeleteLesson = async (moduleId, lessonId) => {
    if (!window.confirm("Delete this lesson?")) return;
    setError(null);
    try {
      await deleteLesson(slug, lessonId);
      setModules((prev) => prev.map((mod) => {
        if (mod.id !== moduleId) return mod;
        return { ...mod, lessons: mod.lessons.filter((l) => l.id !== lessonId) };
      }));
    } catch (err) {
      setError(err.message || "Failed to delete lesson.");
    }
  };

  const handleCourseUpdated = (updatedCourse) => {
    setCourse(updatedCourse);
  };

  const handleLessonSaved = (updatedLesson) => {
    if (!editingLesson) return;
    setModules((prev) => prev.map((mod) => {
      if (mod.id !== editingLesson.moduleId) return mod;
      return {
        ...mod,
        lessons: mod.lessons.map((l) => l.id === updatedLesson.id ? updatedLesson : l),
      };
    }));
    setEditingLesson(null);
  };

  // Find the first lesson to route to for Preview
  const firstLesson = modules.find((m) => m.lessons?.length > 0)?.lessons[0];

  return (
    <div className="max-w-4xl mx-auto py-6">
      <Link href={`/${slug}/classroom`} className="btn btn-ghost -ml-2.5 mb-4 no-underline inline-flex">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Classroom
      </Link>

      {error && (
        <div role="alert" className="mb-4 text-ui text-alert bg-brand-50 rounded-inner px-4 py-3">
          {error}
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-display font-extrabold text-ink">{course.title}</h1>
            {!course.isPublished && (
              <span className="bg-sand-200 text-ink text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider">Draft</span>
            )}
          </div>
          <p className="text-sand-700 mt-2 max-w-2xl">{course.description}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Button 
            variant="secondary" 
            icon={Eye} 
            disabled={!firstLesson}
            onClick={() => firstLesson && router.push(`/${slug}/classroom/${course.slug}/${firstLesson.id}`)}
          >
            Preview
          </Button>
          <Button icon={Settings} onClick={() => setShowSettings(true)}>Course settings</Button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {modules.map((mod) => (
          <Card key={mod.id} className="p-0 overflow-hidden border border-divider">
            <div className="bg-sand-100 border-b border-divider px-4 py-3 flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <GripVertical className="w-4 h-4 text-sand-400 cursor-grab" />
                <Folder className="w-5 h-5 text-sand-600" />
                <h3 className="text-lg font-bold text-ink">{mod.title}</h3>
                <span className="text-meta text-sand-600">{mod.lessons?.length || 0} lesson{(mod.lessons?.length || 0) !== 1 ? "s" : ""}</span>
              </div>
              <div className="flex items-center gap-1">
                <IconButton icon={Plus} label="Add lesson" onClick={() => setAddingLessonTo(mod.id)} />
                <IconButton
                  icon={Trash2}
                  label="Delete module"
                  onClick={() => handleDeleteModule(mod.id)}
                  className="text-alert opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </div>
            </div>
            
            <div className="flex flex-col divide-y divide-divider bg-surface">
              {mod.lessons?.map((lesson) => (
                <div key={lesson.id} className="px-11 py-3 flex items-center justify-between hover:bg-sand-50 transition-colors group">
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-brand" />
                    <span className="font-medium text-ink">{lesson.title}</span>
                    {!lesson.isPublished && (
                      <span className="text-kicker text-sand-500 font-bold uppercase text-[10px]">Draft</span>
                    )}
                    {lesson.isFreePreview && (
                      <span className="text-kicker text-sage-600 font-bold uppercase text-[10px]">Free preview</span>
                    )}
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => setEditingLesson({ moduleId: mod.id, lesson })}>
                      Edit content
                    </Button>
                    <IconButton
                      icon={Trash2}
                      label="Delete lesson"
                      onClick={() => handleDeleteLesson(mod.id, lesson.id)}
                      className="text-alert"
                    />
                  </div>
                </div>
              ))}
              
              {addingLessonTo === mod.id && (
                <div className="px-11 py-3 bg-brand-50">
                  <form onSubmit={(e) => handleAddLesson(e, mod.id)} className="flex items-center gap-3">
                    <Input 
                      autoFocus
                      placeholder="Lesson title..." 
                      value={newLessonTitle} 
                      onChange={(e) => setNewLessonTitle(e.target.value)} 
                      className="h-8 text-sm max-w-xs"
                    />
                    <Button type="submit" size="sm" disabled={savingLesson}>
                      {savingLesson ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Save"}
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => { setAddingLessonTo(null); setNewLessonTitle(""); }}>Cancel</Button>
                  </form>
                </div>
              )}
              
              {!addingLessonTo && (!mod.lessons || mod.lessons.length === 0) && (
                <div className="px-11 py-6 text-center">
                  <p className="text-sand-600 text-sm">This module is empty.</p>
                  <Button variant="secondary" size="sm" className="mt-3" onClick={() => setAddingLessonTo(mod.id)} icon={Plus}>
                    Add a lesson
                  </Button>
                </div>
              )}
            </div>
          </Card>
        ))}

        {addingModule ? (
          <Card className="p-4 border-2 border-brand border-dashed bg-brand-50">
            <form onSubmit={handleAddModule} className="flex items-end gap-4">
              <div className="flex-1">
                <Input 
                  autoFocus
                  label="Module title"
                  placeholder="e.g. Week 1: Basics" 
                  value={newModuleTitle} 
                  onChange={(e) => setNewModuleTitle(e.target.value)} 
                />
              </div>
              <div className="flex items-center gap-2">
                <Button type="button" variant="ghost" onClick={() => { setAddingModule(false); setNewModuleTitle(""); }}>Cancel</Button>
                <Button type="submit" disabled={savingModule}>
                  {savingModule ? <><Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />Saving...</> : "Save module"}
                </Button>
              </div>
            </form>
          </Card>
        ) : (
          <button 
            type="button"
            onClick={() => setAddingModule(true)}
            className="w-full py-6 rounded-panel border-2 border-dashed border-divider text-sand-700 hover:text-ink hover:border-sand-400 flex items-center justify-center gap-2 font-display font-bold transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add new module
          </button>
        )}
      </div>
      
      <CourseSettingsModal
        open={showSettings}
        onClose={() => setShowSettings(false)}
        course={course}
        onSaved={handleCourseUpdated}
        slug={slug}
      />

      <LessonEditorModal
        open={!!editingLesson}
        onClose={() => setEditingLesson(null)}
        lesson={editingLesson?.lesson}
        onSaved={handleLessonSaved}
        slug={slug}
      />
    </div>
  );
}

