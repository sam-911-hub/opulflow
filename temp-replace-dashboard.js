const fs = require('fs');
const path = 'src/app/dashboard/page.tsx';
const src = fs.readFileSync(path, 'utf8');
const start = '          {/* Main Content Area */}';
const end = '      {/* Service Request Modal disabled while fixing syntax */}';
const i = src.indexOf(start);
const j = src.indexOf(end);
if (i === -1 || j === -1 || j <= i) {
  console.error('Markers not found', i, j);
  process.exit(1);
}
const replacement = `          {/* Main Board Area */}
          <div class="lg:col-span-3 space-y-8">
            <div class="bg-white/90 rounded-3xl border border-slate-200 shadow-lg p-6 backdrop-blur-sm">
              <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 class="text-3xl font-bold text-slate-900">Campaign Board</h2>
                  <p class="mt-2 text-sm text-slate-600 max-w-2xl">
                    Manage your campaigns in a Trello-inspired board. Cards are grouped by status and link directly to order details.
                  </p>
                </div>
                <div class="flex flex-wrap gap-3">
                  <a href="/dashboard/place-order" class="inline-flex items-center rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition">
                    + New Campaign
                  </a>
                  <button onClick={() => window.location.reload()} class="inline-flex items-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition">
                    Refresh Board
                  </button>
                </div>
              </div>
            </div>

            <div class="overflow-x-auto pb-4">
              <div class="min-w-[1100px] grid grid-cols-1 md:grid-cols-3 gap-6">
                {[ 
                  { key: 'backlog', title: 'Backlog', description: 'Pending work and new requests' },
                  { key: 'in-progress', title: 'In Progress', description: 'Active campaigns and deliveries' },
                  { key: 'completed', title: 'Completed', description: 'Finished orders and reviews' }
                ].map((column) => {
                  const cards = orders.filter((order) => {
                    if (column.key === 'backlog') return order.status === 'pending';
                    if (column.key === 'completed') return order.status === 'completed';
                    return order.status !== 'pending' && order.status !== 'completed';
                  });

                  return (
                    <div key={column.key} className="rounded-[28px] border border-slate-200 bg-slate-100/95 p-4 shadow-sm">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">{column.title}</h3>
                          <p className="text-sm text-slate-500">{column.description}</p>
                        </div>
                        <span className="inline-flex items-center rounded-full bg-slate-200 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                          {cards.length}
                        </span>
                      </div>
                      <div className="space-y-4">
                        {cards.length > 0 ? cards.map((order) => (
                          <Link key={order.id} href={`/dashboard/orders/${order.id}`} className="block rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-sm font-semibold text-slate-900">Order {order.orderId}</p>
                                <p className="text-sm text-slate-500 mt-1">{getServiceName(order.service || 'service')}</p>
                              </div>
                              <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${order.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : order.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'}`}>
                                {order.status}
                              </span>
                            </div>
                            <div className="mt-4 text-sm text-slate-600 space-y-2">
                              <p>${order.totalCost?.toFixed(2) || '0.00'} • {new Date(order.date).toLocaleDateString()}</p>
                              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{getServiceIcon(order.service || 'T')} • {order.date ? new Date(order.date).toLocaleDateString() : 'No date'}</p>
                            </div>
                          </Link>
                        )) : (
                          <div className="rounded-3xl border border-dashed border-slate-300 bg-white/90 p-6 text-center text-sm text-slate-500">
                            No cards yet.
                          </div>
                        )}
                      </div>
                      <button onClick={() => router.push('/dashboard/place-order')} className="mt-6 w-full rounded-2xl border border-transparent bg-white py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition">
                        + Add card
                      </button>
                    </div>
                  ))}
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-slate-900 mb-4">Board Notes</h3>
                <p className="text-sm text-slate-600 leading-7">
                  Your Trello-style dashboard keeps campaign work organized at a glance. Use the columns to separate pending ideas, active projects, and completed deliveries.
                </p>
              </div>
              <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-lg">
                <h3 className="text-xl font-semibold mb-4">Workflow tips</h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-3">
                    <span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-amber-300"></span>
                    Track new requests in Backlog and start moving cards forward.
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-sky-300"></span>
                    Keep active campaigns visible in the In Progress column.
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-emerald-300"></span>
                    Celebrate completed orders in the Completed column.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>



      {/* Service Request Modal disabled while fixing syntax */}
      {/* Modal content temporarily removed to preserve build stability */}
    </div>
    </div>
`;
fs.writeFileSync(path, src.slice(0, i) + replacement + src.slice(j));
console.log('done');
