import {mount} from "avoriaz"

import Vue from "vue"
import BootstrapVue from "bootstrap-vue"

import Stream from "streams/app/components/Stream.vue"
import PublicStampedElement from "streams/app/components/stamped_elements/PublicStampedElement.vue"
import FollowedStampedElement from "streams/app/components/stamped_elements/FollowedStampedElement.vue"
import {streamStoreOperations, newStreamStore} from "streams/app/stores/streamStore"
import applicationStore from "streams/app/stores/applicationStore"


Vue.use(BootstrapVue)

describe("Stream", () => {
    beforeEach(() => {
        Sinon.restore()
    })

    describe("computed", () => {
        describe("stampedElement", () => {
            it("should render the FollowedStampedElement when stream name is 'followed'", () => {
                let store = newStreamStore({modules: {applicationStore}})
                store.state.applicationStore.profile = {id: 26}
                let target = mount(Stream, {store})
                target.instance().$store.state.streamName = "followed"
                target.instance().stampedElement.should.eq("FollowedStampedElement")
            })

            it("should render the PublicStampedElement when stream name is 'public'", () => {
                let store = newStreamStore({modules: {applicationStore}})
                store.state.applicationStore.profile = {id: 26}
                let target = mount(Stream, {store})
                target.instance().$store.state.streamName = "public"
                target.instance().stampedElement.should.eq("PublicStampedElement")
            })

            it("should render the TagStampedElement when stream name is 'tag'", () => {
                let store = newStreamStore({modules: {applicationStore}})
                store.state.applicationStore.profile = {id: 26}
                let target = mount(Stream, {store})
                target.instance().$store.state.streamName = "tag"
                target.instance().stampedElement.should.eq("TagStampedElement")
            })

            it("should render the ProfileStampedElement when stream name is 'profile'", () => {
                let store = newStreamStore({modules: {applicationStore}})
                store.state.applicationStore.profile = {id: 26}
                let target = mount(Stream, {store})
                target.instance().$store.state.streamName = "profile"
                target.instance().stampedElement.should.eq("ProfileStampedElement")
            })

            it("should display an error when stream name is unknown", () => {
                let store = newStreamStore({modules: {applicationStore}})
                store.state.applicationStore.profile = {id: 26}
                let target = mount(Stream, {store})
                Sinon.spy(console, "error")
                target.instance().$store.state.streamName = "Yolo stream"
                target.instance().stampedElement
                console.error.getCall(0).args[0].should.eq("Unsupported stream name Yolo stream")
            })
        })
    })

    describe("methods", () => {
        describe("onImageLoad", () => {
            it("should call Vue.redrawVueMasonry", () => {
                let target = new Stream({})
                Sinon.spy(Vue, "redrawVueMasonry")
                target.onImageLoad()
            })
        })

        describe("onNewContentClick", () => {
            it("should show the new content button when the user receives new content", (done) => {
                let target = mount(Stream, {})
                target.find(".new-content-container")[0].hasStyle("display", "none").should.be.true
                target.instance().$store.commit(streamStoreOperations.receivedNewContent, 1)
                target.instance().$nextTick(() => {
                    target.find(".new-content-container")[0].hasStyle("display", "none").should.be.false
                    target.find(".new-content-container .badge")[0].text().should.match(/1 new posts available/)
                    done()
                })
            })

            it("should acknowledge new content when the user clicks the button", () => {
                let target = mount(Stream, {})
                target.instance().$store.commit(streamStoreOperations.receivedNewContent, 1)
                Sinon.spy(target.instance().$store, "dispatch")
                target.find(".new-content-load-link")[0].trigger("click")
                target.instance().$store.dispatch.getCall(0).args[0].should.eql(streamStoreOperations.newContentAck)
            })
        })
    })

    describe("Lifecycle", () => {
        describe("render", () => {
            it("should not render unfetched content", () => {
                let target = mount(Stream, {})
                target.find(".grid-item").length.should.eq(0)
                target.instance().$store.commit(streamStoreOperations.receivedNewContent, 1)
                target.find(".grid-item").length.should.eq(0)
            })
        })

        describe("mounted", () => {
            it("should fetch followed stream when stream name is 'followed'", (done) => {
                let store = newStreamStore({modules: {applicationStore}})
                store.state.streamName = "followed"
                Sinon.spy(store, "dispatch")

                let target = mount(Stream, {store})
                target.instance().$nextTick(() => {
                    store.dispatch.getCall(0).args.should.eql([streamStoreOperations.getFollowedStream])
                    done()
                })
            })

            it("should fetch public stream when stream name is 'public'", (done) => {
                let store = newStreamStore({modules: {applicationStore}})
                store.state.streamName = "public"
                Sinon.spy(store, "dispatch")

                let target = mount(Stream, {store})
                target.instance().$nextTick(() => {
                    store.dispatch.getCall(0).args.should.eql([streamStoreOperations.getPublicStream])
                    done()
                })
            })

            it("should fetch tag stream when stream name is 'tag'", (done) => {
                let store = newStreamStore({modules: {applicationStore}})
                store.state.streamName = "tag"
                store.state.tagName = "#yolo"
                Sinon.spy(store, "dispatch")

                let target = mount(Stream, {store})
                target.instance().$nextTick(() => {
                    store.dispatch.getCall(0).args
                        .should.eql([streamStoreOperations.getTagStream, {params: {name: "#yolo"}, data: {}}])
                    done()
                })
            })

            it("should fetch profile stream when stream name is 'profile_all'", (done) => {
                let store = newStreamStore({modules: {applicationStore}})
                store.state.streamName = "profile_all"
                store.state.applicationStore.currentBrowsingProfileId = 26
                store.state.applicationStore.profile = {id: 26}
                Sinon.spy(store, "dispatch")

                let target = mount(Stream, {store})
                target.instance().$nextTick(() => {
                    store.dispatch.getCall(0).args
                        .should.eql([streamStoreOperations.getProfileAll, {params: {id: 26}, data: {}}])
                    done()
                })
            })

            it("should fetch profile stream when stream name is 'profile_pinned'", (done) => {
                let store = newStreamStore({modules: {applicationStore}})
                store.state.streamName = "profile_pinned"
                store.state.applicationStore.currentBrowsingProfileId = 26
                store.state.applicationStore.profile = {id: 26}
                Sinon.spy(store, "dispatch")

                let target = mount(Stream, {store})
                target.instance().$nextTick(() => {
                    store.dispatch.getCall(0).args
                        .should.eql([streamStoreOperations.getProfilePinned, {params: {id: 26}, data: {}}])
                    done()
                })
            })
        })
    })
})
