import { useState, useEffect, useCallback } from "react";
import { Shield, Search, Filter, Calendar, User, Activity } from "lucide-react";
import api from "../services/api";

function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(
        `/audit/logs.php?page=${page}&type=${filterType}&search=${searchQuery}`
      );
      if (response.data.success) {
        setLogs(response.data.logs);
        setTotalPages(response.data.totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch audit logs:", error);
    } finally {
      setLoading(false);
    }
  }, [page, filterType, searchQuery]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  const getActionIcon = (action) => {
    switch (action) {
      case "create":
        return "➕";
      case "update":
        return "✏️";
      case "delete":
        return "🗑️";
      case "login":
        return "🔐";
      case "logout":
        return "🚪";
      default:
        return "📝";
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case "create":
        return "success";
      case "update":
        return "info";
      case "delete":
        return "danger";
      case "login":
        return "primary";
      case "logout":
        return "secondary";
      default:
        return "default";
    }
  };

  return (
    <div className="audit-logs-page">
      <div className="page-header">
        <div>
          <h1>
            <Shield size={28} />
            Audit Logs
          </h1>
          <p>Track all system activities and admin actions</p>
        </div>
      </div>

      <div className="logs-toolbar">
        <form onSubmit={handleSearch} className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search by action, user, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ backgroundColor: "transparent", border: "none", outline: "none", boxShadow: "none" }}
          />
        </form>

        <div className="filter-box">
          <Filter size={20} />
          <select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">All Actions</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
            <option value="login">Login</option>
            <option value="logout">Logout</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading audit logs...</p>
        </div>
      ) : logs.length > 0 ? (
        <>
          <div className="logs-table-container">
            <table className="logs-table">
              <thead>
                <tr>
                  <th>Action</th>
                  <th>User</th>
                  <th>Description</th>
                  <th>IP Address</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td>
                      <span className={`action-badge action-${getActionColor(log.action)}`}>
                        <span className="action-icon">{getActionIcon(log.action)}</span>
                        {log.action}
                      </span>
                    </td>
                    <td>
                      <div className="user-cell">
                        <User size={16} />
                        <span>{log.userName}</span>
                      </div>
                    </td>
                    <td className="description-cell">{log.description}</td>
                    <td className="ip-cell">{log.ipAddress}</td>
                    <td className="timestamp-cell">
                      <Calendar size={14} />
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="btn-pagination"
              >
                Previous
              </button>
              <span className="page-info">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className="btn-pagination"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="empty-state">
          <Activity size={48} />
          <h3>No audit logs found</h3>
          <p>System activities will appear here</p>
        </div>
      )}
    </div>
  );
}

export default AuditLogs;
