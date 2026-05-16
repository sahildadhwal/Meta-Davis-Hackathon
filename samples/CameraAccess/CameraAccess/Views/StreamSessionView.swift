/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

//
// StreamSessionView.swift
//
//

import MWDATCore
import SwiftUI

struct StreamSessionView: View {
  let wearables: WearablesInterface
  var wearablesViewModel: WearablesViewModel
  @State private var viewModel: StreamSessionViewModel
  @State private var agriVM = AgriLensViewModel()

  init(wearables: WearablesInterface, wearablesVM: WearablesViewModel) {
    self.wearables = wearables
    self.wearablesViewModel = wearablesVM
    self._viewModel = State(wrappedValue: StreamSessionViewModel(wearables: wearables))
  }

  var body: some View {
    ZStack {
      if viewModel.isStreaming {
        StreamView(viewModel: viewModel, wearablesVM: wearablesViewModel, agriVM: agriVM)
      } else {
        NonStreamView(viewModel: viewModel, wearablesVM: wearablesViewModel, agriVM: agriVM)
      }
    }
    .onDisappear {
      viewModel.endSession()
    }
    .sheet(isPresented: Bindable(agriVM).showDiagnosis) {
      DiagnosisView(agriVM: agriVM)
    }
    .sheet(isPresented: Bindable(agriVM).showSettings) {
      AgriLensSettingsView(agriVM: agriVM)
    }
    .alert("Error", isPresented: $viewModel.showError) {
      Button("OK") { viewModel.dismissError() }
    } message: {
      Text(viewModel.errorMessage)
    }
    .alert("Photo capture failed", isPresented: $viewModel.showPhotoCaptureError) {
      Button("OK") { viewModel.dismissPhotoCaptureError() }
    } message: {
      Text("Unable to capture photo. This may be due to low storage on device or another capture already in progress. Please try again in a few moments.")
    }
    .alert("AgriLens Error", isPresented: Bindable(agriVM).hasError) {
      Button("OK") { agriVM.hasError = false }
    } message: {
      Text(agriVM.errorMessage)
    }
  }
}
