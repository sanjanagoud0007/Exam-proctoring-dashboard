import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import API from "../services/api";
import { getApiErrorMessage } from "../utils/apiError";
import AppLayout from "../components/layout/AppLayout";
import GlassCard from "../components/ui/GlassCard";
import Button from "../components/ui/Button";
import { useToast } from "../context/ToastContext";
import { AuthContext } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { compressImageFile } from "../utils/compressImage";

const Profile = () => {
  const { user, syncUser, refreshUser } = useContext(AuthContext);
  const { setTheme } = useTheme();
  const { i18n } = useTranslation();
  const [preview, setPreview] = useState(user?.profileImage || "");
  const [language, setLanguage] = useState(
    user?.preferredLanguage || "en"
  );
  const [themePref, setThemePref] = useState(user?.theme || "dark");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    refreshUser()
      .then((data) => {
        if (data?.profileImage) setPreview(data.profileImage);
        if (data?.preferredLanguage) setLanguage(data.preferredLanguage);
        if (data?.theme) setThemePref(data.theme);
      })
      .catch(() => {});
  }, [refreshUser]);

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast("Please select an image file", "error");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast("Image must be under 8MB", "error");
      return;
    }
    try {
      const result = await compressImageFile(file);
      setPreview(result);
      if (user?._id) {
        localStorage.setItem(`profileImage_${user._id}`, result);
      }
    } catch {
      toast("Could not process image", "error");
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        preferredLanguage: language,
        theme: themePref,
      };
      if (preview) {
        payload.profileImage = preview;
      }

      const { data } = await API.put("/auth/profile", payload);

      const updated = syncUser({
        ...data,
        approved: data.approved ?? user?.approved,
      });
      setTheme(themePref);
      i18n.changeLanguage(language);
      localStorage.setItem("language", language);
      if (user?._id && preview) {
        localStorage.setItem(`profileImage_${user._id}`, preview);
      }
      toast("Profile saved successfully", "success");
    } catch (err) {
      toast(getApiErrorMessage(err, "Save failed"), "error");
    }
    setSaving(false);
  };

  return (
    <AppLayout title="Settings">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
          Profile settings
        </h1>
        <GlassCard className="space-y-6">
          {user?.role === "student" && user.approved !== true && (
            <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-200">
              <p className="font-semibold">Approval required</p>
              <p className="mt-1 text-amber-100/90">
                Profile settings are saved, but a proctor or admin must approve
                your student account before you can take exams.
              </p>
              <Button
                type="button"
                variant="secondary"
                className="mt-3"
                onClick={async () => {
                  try {
                    const data = await refreshUser();
                    if (data.approved) {
                      toast("Account approved — redirecting…", "success");
                      window.location.href = "/dashboard";
                    } else {
                      toast("Still pending admin approval", "error");
                    }
                  } catch (err) {
                    toast(getApiErrorMessage(err), "error");
                  }
                }}
              >
                Check approval status
              </Button>
            </div>
          )}

          <div className="flex flex-col items-center">
            <div className="h-32 w-32 rounded-full overflow-hidden border-2 border-cyan-500 bg-slate-800">
              {preview ? (
                <img
                  src={preview}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-slate-500 text-sm">
                  No photo
                </div>
              )}
            </div>
            <label className="mt-4 cursor-pointer rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold hover:bg-cyan-500">
              Upload profile photo
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onFile}
              />
            </label>
            <p className="mt-2 text-xs text-slate-400 text-center">
              Optional — shown on your profile only
            </p>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">
              Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full rounded-xl bg-slate-900 border border-slate-600 px-4 py-2"
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी</option>
              <option value="te">తెలుగు</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">
              Theme
            </label>
            <select
              value={themePref}
              onChange={(e) => setThemePref(e.target.value)}
              className="w-full rounded-xl bg-slate-900 border border-slate-600 px-4 py-2"
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
            </select>
          </div>

          <p className="text-sm text-slate-300">
            {user?.name} · {user?.email} · {user?.role}
          </p>

          <Button
            type="button"
            disabled={saving}
            onClick={save}
            className="w-full"
          >
            {saving ? "Saving…" : "Save profile"}
          </Button>
        </GlassCard>
      </div>
    </AppLayout>
  );
};

export default Profile;
