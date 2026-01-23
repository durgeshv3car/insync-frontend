import React from "react";
import PageHeader from "@/components/shared/pageHeader/PageHeader";
import PageHeaderDate from "@/components/shared/pageHeader/PageHeaderDate";

const Home = () => {
  return (
    <>
      <PageHeader>
        <PageHeaderDate />
      </PageHeader>

      <div className="container-fluid mt-4">
        {/* Title */}
        <div className="row mb-4">
          <div className="col-12">
            <h4 className="fw-bold">Dashboard Analytics</h4>
            <p className="text-muted mb-0">
              Overview of sales, leads, tasks, and performance
            </p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="row g-3 mb-4">
          <div className="col-xl-3 col-md-6">
            <div className="card shadow-sm">
              <div className="card-body">
                <h6 className="text-muted">Total Sales</h6>
                <h3 className="fw-bold">$45,200</h3>
                <span className="text-success">+12%</span>
              </div>
            </div>
          </div>

          <div className="col-xl-3 col-md-6">
            <div className="card shadow-sm">
              <div className="card-body">
                <h6 className="text-muted">New Leads</h6>
                <h3 className="fw-bold">1,245</h3>
                <span className="text-primary">+8%</span>
              </div>
            </div>
          </div>

          <div className="col-xl-3 col-md-6">
            <div className="card shadow-sm">
              <div className="card-body">
                <h6 className="text-muted">Tasks Completed</h6>
                <h3 className="fw-bold">320</h3>
                <span className="text-warning">75%</span>
              </div>
            </div>
          </div>

          <div className="col-xl-3 col-md-6">
            <div className="card shadow-sm">
              <div className="card-body">
                <h6 className="text-muted">Pending Issues</h6>
                <h3 className="fw-bold">18</h3>
                <span className="text-danger">-4%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Charts & Overview */}
        <div className="row g-3 mb-4">
          <div className="col-lg-8">
            <div className="card shadow-sm h-100">
              <div className="card-header bg-white fw-bold">
                Payment Records
              </div>
              <div className="card-body d-flex align-items-center justify-content-center text-muted">
                Chart Placeholder
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card shadow-sm h-100">
              <div className="card-header bg-white fw-bold">
                Tasks Overview
              </div>
              <div className="card-body">
                <p className="mb-2">Completed</p>
                <div className="progress mb-3">
                  <div className="progress-bar bg-success" style={{ width: "70%" }}>
                    70%
                  </div>
                </div>

                <p className="mb-2">In Progress</p>
                <div className="progress mb-3">
                  <div className="progress-bar bg-warning" style={{ width: "20%" }}>
                    20%
                  </div>
                </div>

                <p className="mb-2">Pending</p>
                <div className="progress">
                  <div className="progress-bar bg-danger" style={{ width: "10%" }}>
                    10%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tables & Lists */}
        <div className="row g-3">
          <div className="col-lg-8">
            <div className="card shadow-sm">
              <div className="card-header bg-white fw-bold">
                Latest Leads
              </div>
              <div className="card-body p-0">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>John Doe</td>
                      <td>john@example.com</td>
                      <td><span className="badge bg-success">Converted</span></td>
                    </tr>
                    <tr>
                      <td>Sarah Smith</td>
                      <td>sarah@example.com</td>
                      <td><span className="badge bg-warning">Pending</span></td>
                    </tr>
                    <tr>
                      <td>Mike Brown</td>
                      <td>mike@example.com</td>
                      <td><span className="badge bg-danger">Lost</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card shadow-sm">
              <div className="card-header bg-white fw-bold">
                Team Progress
              </div>
              <div className="card-body">
                <p className="mb-1">Design Team</p>
                <div className="progress mb-3">
                  <div className="progress-bar" style={{ width: "85%" }}>85%</div>
                </div>

                <p className="mb-1">Development</p>
                <div className="progress mb-3">
                  <div className="progress-bar bg-info" style={{ width: "65%" }}>65%</div>
                </div>

                <p className="mb-1">Marketing</p>
                <div className="progress">
                  <div className="progress-bar bg-warning" style={{ width: "50%" }}>50%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
