import { useState } from 'react';
import { useListTeamsQuery, useCreateTeamMutation } from '../../features/teams/teamsApi';
import { PageSpinner } from '../../components/Spinner';
import { Modal } from '../../components/Modal';
import { apiErrorMessage, useToast } from '../../features/ui/useToast';

const emptyForm = {
  name: '',
  slug: '',
  nationality: '',
  colorPrimary: '#E10600',
  colorSecondary: '#0A0A0F',
  colorAccent: '#FFFFFF',
  foundedYear: new Date().getFullYear(),
  description: '',
};

export default function AdminTeamsPage() {
  const { data, isLoading } = useListTeamsQuery();
  const [createTeam, { isLoading: creating }] = useCreateTeamMutation();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const toast = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createTeam(form).unwrap();
      toast('Team created', 'success');
      setOpen(false);
      setForm(emptyForm);
    } catch (err) {
      toast(apiErrorMessage(err, 'Could not create team'), 'error');
    }
  }

  if (isLoading) return <PageSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-white">Teams</h1>
        <button type="button" onClick={() => setOpen(true)} className="btn-primary px-4 py-2 text-xs">
          + New Team
        </button>
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 text-xs uppercase tracking-wide text-white/40">
            <tr>
              <th className="px-4 py-3">Team</th>
              <th className="px-4 py-3">Nationality</th>
              <th className="px-4 py-3">Founded</th>
              <th className="px-4 py-3">Colors</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {data?.data.map((team) => (
              <tr key={team.id}>
                <td className="px-4 py-3 font-medium text-white">{team.name}</td>
                <td className="px-4 py-3 text-white/60">{team.nationality}</td>
                <td className="px-4 py-3 text-white/60">{team.foundedYear}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    {[team.colorPrimary, team.colorSecondary, team.colorAccent].map((c) => (
                      <span key={c} className="h-4 w-4 rounded-full border border-white/10" style={{ background: c }} />
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="New Team">
        <form onSubmit={handleSubmit} className="space-y-3">
          <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" />
          <input required placeholder="Slug (e.g. mercedes)" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="input-field" />
          <input required placeholder="Nationality" value={form.nationality} onChange={(e) => setForm({ ...form, nationality: e.target.value })} className="input-field" />
          <input
            required
            type="number"
            placeholder="Founded Year"
            value={form.foundedYear}
            onChange={(e) => setForm({ ...form, foundedYear: Number(e.target.value) })}
            className="input-field"
          />
          <div className="grid grid-cols-3 gap-2">
            {(['colorPrimary', 'colorSecondary', 'colorAccent'] as const).map((key) => (
              <label key={key} className="block">
                <span className="label">{key.replace('color', '')}</span>
                <input type="color" value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className="h-10 w-full rounded border border-white/10 bg-base-800" />
              </label>
            ))}
          </div>
          <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field min-h-20" />
          <button type="submit" disabled={creating} className="btn-primary w-full">
            {creating ? 'Creating…' : 'Create Team'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
